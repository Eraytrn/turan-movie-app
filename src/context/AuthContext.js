import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { generateToken, verifyToken } from '../utils/auth';

const AuthContext = createContext();

export function AuthContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    const signUp = async (email, password) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const { token, isAdmin } = await generateToken(userCredential.user);
            localStorage.setItem('authToken', token);
            
            if (isAdmin) {
                await setDoc(doc(db, 'admins', email), {
                    email: email,
                    createdAt: new Date(),
                    lastLogin: new Date()
                });
            } else {
                await setDoc(doc(db, 'users', email), {
                    watchLaterMovies: [],
                    likedMovies: [],
                    email: email,
                    createdAt: new Date(),
                    lastLogin: new Date()
                });
            }

            setIsAdmin(isAdmin);
            return userCredential;
        } catch (error) {
            throw error;
        }
    };

    const logIn = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const { token, isAdmin } = await generateToken(userCredential.user);
            localStorage.setItem('authToken', token);
            
            if (isAdmin) {
                await setDoc(doc(db, 'admins', email), {
                    lastLogin: new Date()
                }, { merge: true });
            } else {
                await setDoc(doc(db, 'users', email), {
                    lastLogin: new Date()
                }, { merge: true });
            }
            
            setIsAdmin(isAdmin);
            
            if (isAdmin) {
                navigate('/admin');
            } else {
                navigate('/');
            }

            return userCredential;
        } catch (error) {
            throw error;
        }
    };

    const logOut = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('authToken'); 
            setUser(null);
            setIsAdmin(false);
            navigate('/');
        } catch (error) {
            throw error;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const { token, isAdmin } = await generateToken(currentUser);
                localStorage.setItem('authToken', token);
                
                const docRef = isAdmin 
                    ? doc(db, 'admins', currentUser.email)
                    : doc(db, 'users', currentUser.email);
                
                const docSnap = await getDoc(docRef);
                if (!docSnap.exists()) {
                    await setDoc(docRef, {
                        email: currentUser.email,
                        createdAt: new Date(),
                        lastLogin: new Date(),
                        ...(isAdmin ? {} : { watchLaterMovies: [], likedMovies: [] })
                    });
                }

                setUser(currentUser);
                setIsAdmin(isAdmin);
            } else {
                setUser(null);
                setIsAdmin(false);
                localStorage.removeItem('authToken');
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ signUp, logIn, logOut, user, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function UserAuth() {
    return useContext(AuthContext);
}

'use client'; // this is a client component 👈🏽
import axios from 'axios';
import { firestore, auth } from '../db';
import { collection, doc, onSnapshot, setDoc, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";

const AUTH_TOKEN = '';
const endpoint = `https://api.thenextleg.io`;

export default function Home() {
  const [text, setText] = useState('');
  const [imgs, setImgs] = useState<{ createdAt: any; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState('');
  const [user, setUser] = useState<any>();

  useEffect(() => {
    // onSnapshot(collection(firestore, 'imgs'), snapshot => {
    //   let allImgs: { createdAt: any; url: string }[] = snapshot.docs.map(
    //     doc => doc.data(),
    //   ) as any;
    //   setImgs(allImgs);
    // });
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        fetchImages(user);
      } else {
        setImgs([]);
      }
    });
  }, []);

  const fetchImages = async (user: any) => {
    console.log(`${user.uid}`);
    const snapshot = await getDocs(collection(firestore, `/users/${user.uid}/images`));
    let allImgs: { createdAt: any; url: string }[] = snapshot.docs.map((doc) => {
      console.log(doc.id, " => ", doc.data());
      return doc.data();
    }) as any;
    setImgs(allImgs);
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
          const token = credential.accessToken;
          // The signed-in user info.
          const user = result.user;
          // IdP data available using getAdditionalUserInfo(result)
          // ...
          console.log(user);
          console.log(token);
        }
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  };

  const handleLogout = async () => {
    console.log("logout");
    auth.signOut();
  };

  const LogInView = () => {
    return (
      <div className='container mx-auto h-screen flex flex-col items-center justify-center '>
        <div className='w-full mx-auto px-20'>
          <div>Please log in to view images.</div >
          <button onClick={handleLogin}>Login with Google</button>
        </div >
      </div>
    );
  }

  const HomeView = () => {
    return (
      <>
        <div>
          <div className='w-full mx-auto px-20'>
            <button onClick={handleLogout}>Logout</button>
          </div>
          {/* tailwindui.com */}
          <label
            htmlFor='email'
            className='block text-sm font-medium leading-6 text-gray-900'
          >
            Prompt
          </label>
          <div className='mt-2 flex space-x-2'>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
              placeholder='Enter your prompt here'
            />
            <button
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
              onClick={async () => {
                console.log(`Submitting my prompt: ${text}`);
                setLoading(true);
                try {
                  let headers = {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${AUTH_TOKEN}`,
                  };

                  let r = await axios.post(
                    `${endpoint}`,
                    {
                      cmd: 'imagine',
                      msg: text,
                    },
                    { headers },
                  );

                  console.log(r.data);
                  setResponse(JSON.stringify(r.data, null, 2));
                } catch (e: any) {
                  console.log(e);
                  setError(e.message);
                }
                setLoading(false);
              }}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
          <pre>Response Message: {response}</pre>
          Error: {error}
        </div>
        <div>
          <h1 className='text-4xl py-8'>These are your images!</h1>
          <div className='grid grid-cols-3 gap-4'>
            {imgs.map(img => (
              <img
                src={img.url}
                className='w-full'
                key={img.url}
                alt='nothing'
              />
            ))}
          </div>
        </div>
      </>
    );
  }

  console.log(auth);

  return (
    <div className='container mx-auto h-screen flex flex-col items-center justify-center '>
      <div className='w-full mx-auto px-20'>
        {user ? (<HomeView></HomeView>) : (<LogInView></LogInView>)}
      </div>
    </div>
  );
}

'use client'; // this is a client component 👈🏽
import axios from 'axios';
import { Masonry } from 'react-plock';
import { firestore, auth } from '../db';
import { sendImagineAPIAndSave } from './api/txt2img';
import { collection, doc, onSnapshot, setDoc, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";

const AUTH_TOKEN = '';
const endpoint = `https://api.thenextleg.io`;

export default function Home() {
  const [imgs, setImgs] = useState<{ createdAt: any; imageUrl: string }[]>([]);
  const [user, setUser] = useState<any>();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        fetchImages(user);
      } else {
        setImgs([]);
      }

      if (user != null) {
        onSnapshot(collection(firestore, `users/${user.uid}/images`), snapshot => {
          let allImgs: { createdAt: any; imageUrl: string }[] = snapshot.docs.map(
            doc => doc.data(),
          ) as any;
          setImgs(allImgs);
        });
      }
    });
  }, []);

  const fetchImages = async (user: any) => {
    console.log(`${user.uid}`);
    const snapshot = await getDocs(collection(firestore, `/users/${user.uid}/images`));
    let allImgs: { createdAt: any; imageUrl: string }[] = snapshot.docs.map((doc) => {
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

  const ImagesMasonry = () => {
    return (
      <Masonry
        items={imgs}
        config={{
          columns: [5],
          gap: [8],
        }}
        render={(item: { imageUrl: string }) => (
          <img key={item.imageUrl} src={item.imageUrl} style={{ width: "100%", height: "auto" }} />
        )}
      />
    );
  };

  const Form = () => {
    const [text, setText] = useState("")

    interface FormDataType { text: string }
    const responseBody: FormDataType = { text: "" }

    const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      // responseBody.text = text
      // console.log(JSON.stringify(responseBody))
      await sendImagineAPIAndSave(text, user.uid);
    }

    const inputChangeHandler = (setFunction: React.Dispatch<React.SetStateAction<string>>, event: React.ChangeEvent<HTMLInputElement>) => {
      setFunction(event.target.value)
    }

    return (
      <form onSubmit={onSubmitHandler}>
        <div><input id="tttt" onChange={(e) => inputChangeHandler(setText, e)} type="text" placeholder='Enter your prompt here' /></div>
        <input type="submit" />
      </form>
    )
  }

  const HomeView = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [response, setResponse] = useState('');

    return (
      <>
        <div className='w-full mx-auto'>
          <button onClick={handleLogout}>Logout</button>
        </div>
        <div className='mt-2 flex space-x-2'>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            className='block w-full'
            placeholder='Enter your prompt here'
          />
          <button
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            onClick={async () => {
              console.log(`Submitting my prompt: ${text}`);
              setLoading(true);
              await sendImagineAPIAndSave(text, user.uid);
              setLoading(false);
            }}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
        <div className='mt-2 flex space-x-2'>
          <ImagesMasonry></ImagesMasonry>
          {/* <div className='grid grid-cols-3 gap-4'>
            {imgs.map(img => (
              <img src={img.imageUrl} className='w-full' key={img.imageUrl} alt='nothing' />
            ))}
          </div> */}
        </div>
      </>
    );
  }

  return (
    <div className='container mx-auto h-screen flex flex-col items-center'>
      <div className='w-full mx-auto px-20'>
        {user ? (<HomeView></HomeView>) : (<LogInView></LogInView>)}
      </div>
    </div>
  );
}

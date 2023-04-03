import * as anchor from '@project-serum/anchor'
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram } from "@solana/web3.js"; //
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { getAvatarUrl } from "src/functions/getAvatarUrl";
import { getRandomName } from "src/functions/getRandomName";
import idl from "src/idl.json";
// To fetch the programme addresses we use this. 
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey'
// it is a formating purpose 
import { utf8 } from '@project-serum/anchor/dist/cjs/utils/bytes'
import Navbar from 'src/components/Navbar';


// Takes the address from the IDL
// PublicKey import will generate a public key based of the address
const PROGRAM_KEY = new PublicKey(idl.metadata.address);

// The context where all the fetched data will be stored.
const BlogContext = createContext();

// A context is created where the data will be stored
// So it can be accessed by other react components
export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error("Parent must be wrapped inside PostsProvider");
  }
  return context;
};

export const BlogProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [initialized, setInitialized] = useState(false);
  const [posts, setPosts] = useState([])
  const [transactionPending, setTransactionPending] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [lastPostId, setLastPostId] = useState()

  // React Hooks that will be used to setup
  // a connection with the wallet and contract 
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  // A function that creates a connection to the wallet
  // and extracts all the data from the smart contract
  const program = useMemo(() => {
    if (anchorWallet) {
      const provider = new anchor.AnchorProvider
        (connection, anchorWallet,
          anchor.AnchorProvider.defaultOptions())
      return new anchor.Program(idl, PROGRAM_KEY, provider)
    }
  }, [connection, anchorWallet])

  useEffect(() => {

    // This start function checks if there is a user
    // If there is a user it will fetch posts
    // If there is no user it will keep the state to false
    const start = async () => {
      if (program && publicKey) {
        try {
          // Check if there is a user account, by checking the address and 
          // retrieve the account from that address 
          const [userPda] = await findProgramAddressSync([utf8.encode('user'),
          publicKey.toBuffer()], program.programId)
          const user = await program.account.userAccount.fetch(userPda)
          if (user) {
            setInitialized(true)
            setUser(user)
            setLastPostId(user.lastPostId)
            const postAccounts = await
              program.account.postAccount.all(publicKey.toString())
            setPosts(postAccounts)
          }
        } catch (error) {
          console.log(error)
          setInitialized(false)
        }
      }
    }

    start()

  }, [program, publicKey, transactionPending]);


  const initUser = async () => {
    if (program && publicKey) {
      // Caling the solana smart contract function
      try {
        setTransactionPending(true)
        // By checking the address we see if there is already an account
        // If there is an not an already initialized address, we will use it 
        const [userPda] = findProgramAddressSync([utf8.encode('user'), 
        publicKey.toBuffer()], program.programId)
        const name = getRandomName();
        const avatar = getAvatarUrl(name);

        // program holds all the information and functions from the smart contract
        // It will be used to initialize the user by calling the 
        // instructions and functions from the contract and the accounts
        await program.methods
          .initUser(name, avatar)
          .accounts({
            userAccount: userPda,
            authority: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc()
        setInitialized(true)
      } catch (error) {
        console.log(error)
      } finally {
        setTransactionPending(false)
      }
    }
  }

  const createPost = async (title, content) => {
    if (program && publicKey) {
      setTransactionPending(true)
      try {
        const [userPda] = findProgramAddressSync([utf8.encode('user'), publicKey.toBuffer()], program.programId)
        const [postPda] = findProgramAddressSync([utf8.encode('post'), publicKey.toBuffer(), Uint8Array.from([lastPostId])], program.programId)

        await program.methods
          .createPost(title, content)
          .accounts({
            userAccount: userPda,
            postAccount: postPda,
            authority: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc()

        setShowModal(false)
      } catch (error) {
        console.error(error)
      } finally {
        setTransactionPending(false)
      }
    }
  }

  return (
    <BlogContext.Provider
      value={{
        user,
        posts,
        initialized,
        initUser,
        createPost,
        showModal,
        setShowModal,
      }}
    >
      <Navbar/>
      {children}
    </BlogContext.Provider>
  );
};

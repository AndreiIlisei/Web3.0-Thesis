import { AnchorProvider, Program } from "@project-serum/anchor";
import {
  useAnchorWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPostById } from "src/context/functions/getPostById";
import idl from "src/idl.json";
import { useBlog } from "../context/Blog";

const PROGRAM_KEY = new PublicKey(idl.metadata.address);

function getProgram(provider) {
  return new Program(idl, PROGRAM_KEY, provider);
}

export const FullPost = () => {
  const { id } = useParams();
  const { user } = useBlog();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [provider, setProvider] = useState();
  const [post, setPost] = useState();


  console.log(user)
  useEffect(() => {
    try {
      if (provider) {
        const getPost = async () => {
          const program = getProgram(provider);
          const post = await getPostById(id.toString(), program);
          setPost(post);
        };
        getPost();
      }
    } catch { }
  }, [provider]);

  useEffect(() => {
    if (wallet) {
      const provider = new AnchorProvider(connection, wallet, {});
      setProvider(provider);
    }
  }, [connection, wallet]);


  return (
    <div>
    <div className="bg-white min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <img className="w-full h-96 object-cover mt-10 mb-8" src="https://img.huffingtonpost.com/asset/5fa3fd152400000a1f9ae10a.jpeg?cache=ZxsH6wZyAA&ops=800_450" alt="Post" />
        <div className="flex items-center mb-4">
          <img className="w-12 h-12 object-cover rounded-full mr-4" src={user?.avatar} alt="Author logo" />
          <h4 className="text-2xl capitalize text-black font-semibold">{user?.name}</h4>
        </div>
        <p className="text-black text-center text-lg leading-relaxed">{post?.content}</p>
      </div>
    </div>
  </div>
  );
};

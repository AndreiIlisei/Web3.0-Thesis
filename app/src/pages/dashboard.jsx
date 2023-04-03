import { useWallet } from "@solana/wallet-adapter-react"
import { PhantomWalletName } from "@solana/wallet-adapter-wallets"
import { useEffect, useState } from "react"
import { Button } from "src/components/Button"
import { PostForm } from "src/components/PostForm"
import { useBlog } from "src/context/Blog"
import { useHistory } from 'react-router-dom'

export const Dashboard = () => {
  const history = useHistory()
  const { user, posts, initialized, initUser, createPost, showModal, setShowModal, } = useBlog()
  const [postTitle, setPostTitle] = useState("")
  const [postContent, setPostContent] = useState("")

  return (
    <div className="dashboard">
      <div className="relative w-full h-screen text-white">
        <video className="absolute w-full h-full object-cover" src="..\public\video\video-1.mp4" autoPlay loop muted />
        <div className="flex flex-col items-center justify-center h-screen ">
          <h1 className="text-6xl z-10">LET THE WORLD KNOW YOU</h1>
          <p className="mt-2 text-2xl z-10">Post your adventures alongside mine</p>
        </div>
      </div>

      <div className="all__posts">
        {posts.map((item) => {
          return (
            <article className="post__card-2"
              onClick={() => {
                history.push(`/read-post/${item.publicKey.toString()}`)
              }}
              key={item.account.id}
            >
              <div className="post__card_-2">
                <div
                  className="post__card__image-2"
                  style={{
                    backgroundImage: `url("https://teachershelp.ru/wp-content/uploads/2012/08/Traveling.jpg)`,
                  }}
                ></div>
                <div>
                  <div className="post__card_meta-2">
                    <div className="post__card_cat"><span className="dot"> </span>{item.account.title} </div>
                    <p className="post__card_alttitle-2">
                     {item.account.content ? item.account.content : "Nothing Was Written here"}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div className={`modal ${showModal && 'show-modal'}`} >
        <div className="modal-content">
          <span className="close-button"
            onClick={() => setShowModal(false)}
          >×</span>
          <PostForm
            postTitle={postTitle}
            postContent={postContent}
            setPostTitle={setPostTitle}
            setPostContent={setPostContent}
            onSubmit={() => createPost(postTitle, postContent)}
          />
        </div>
      </div>
    </div>
  )
}

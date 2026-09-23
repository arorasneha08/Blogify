import { useContext, useEffect } from "react";
import { FaHeart, FaRegCommentDots, FaTwitter } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";
import { Link } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

import { BlogContext } from "../pages/BlogPage";
import { UserContext } from "../App";

const BlogInteraction = () => {

    const {
        blog,
        setBlog,
        isLikedByUser,
        setIsLikedByUser,
        setCommentsWrapper
    } = useContext(BlogContext);

    const {
        _id,
        title,
        blog_id,
        activity = {},
        author = {}
    } = blog;

    const {
        total_likes = 0,
        total_comments = 0
    } = activity;

    const {
        personal_info = {}
    } = author;

    const {
        username: author_username
    } = personal_info;

    const {
        userAuth: {
            username,
            access_token
        }
    } = useContext(UserContext);

    useEffect(() => {

        if (!access_token || !_id) {
            return;
        }

        axios.post(
            import.meta.env.VITE_SERVER_DOMAIN + "/isliked-by-user",
            { _id },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            }
        )
        .then(({ data }) => {

            setIsLikedByUser(Boolean(data.result));

        })
        .catch((err) => {

            console.error(
                "LIKE STATUS ERROR:",
                err.response?.data || err.message
            );

        });

    }, [_id, access_token, setIsLikedByUser]);

    const handleLike = async () => {

        if (!access_token) {
            toast.error("Please login to like the blog");
            return;
        }

        const previousLikeState = isLikedByUser;
        const newLikeState = !previousLikeState;

        const newTotalLikes = newLikeState
            ? total_likes + 1
            : Math.max(0, total_likes - 1);

        // Optimistic UI
        setIsLikedByUser(newLikeState);

        setBlog(prev => ({
            ...prev,
            activity: {
                ...prev.activity,
                total_likes: newTotalLikes
            }
        }));

        try {

            await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/like-blog",
                {
                    _id,
                    isLikedByUser: previousLikeState
                },
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                }
            );

        } catch (err) {

            console.error(
                "LIKE ERROR:",
                err.response?.data || err.message
            );

            // Rollback UI
            setIsLikedByUser(previousLikeState);

            setBlog(prev => ({
                ...prev,
                activity: {
                    ...prev.activity,
                    total_likes: total_likes
                }
            }));

            toast.error("Error liking the blog");
        }
    };

    return (
        <>
            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{ duration: 2000 }}
            />

            <hr className="border-grey my-2" />

            <div className="flex gap-6 justify-between">

                <div className="flex gap-3 items-center">

                    <button
                        className={
                            "w-10 h-10 rounded-full flex items-center justify-center bg-grey/80 text-2xl " +
                            (isLikedByUser
                                ? "text-red bg-red/20"
                                : "bg-grey/80")
                        }
                        onClick={handleLike}
                    >
                        {isLikedByUser ? (
                            <FaHeart className="text-red" />
                        ) : (
                            <CiHeart className="text-dark-grey" />
                        )}
                    </button>

                    <p className="text-xl text-dark-grey">
                        {total_likes}
                    </p>

                    <button
                        onClick={() =>
                            setCommentsWrapper(prev => !prev)
                        }
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80 text-2xl"
                    >
                        <FaRegCommentDots />
                    </button>

                    <p className="text-xl text-dark-grey">
                        {total_comments}
                    </p>

                </div>

                <div className="flex gap-6 items-center">

                    {username === author_username && (
                        <Link
                            to={`/editor/${blog_id}`}
                            className="underline hover:text-purple"
                        >
                            Edit
                        </Link>
                    )}

                    <a
                        href={`https://twitter.com/intent/tweet?text=Read ${encodeURIComponent(
                            title
                        )}&url=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaTwitter className="text-xl hover:text-twitter" />
                    </a>

                </div>

            </div>

            <hr className="border-grey my-2" />
        </>
    );
};

export default BlogInteraction;
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import AnimationWrapper from "../common/page-animation";
import Loader from "../components/Loader";
import { getDay } from "../common/date";
import BlogInteraction from "../components/BlogInteraction";
import BlogPostCard from "../components/BlogPostCard";
import BlogContent from "../components/BlogContent";
import CommentsContainer, { fetchComments } from "../components/CommentsContainer";

export const blogStructure = {
    title: "",
    des: "",
    content: {
        blocks: []
    },
    tags: [],
    author: {
        _id: "",
        personal_info: {
            fullName: "",
            username: "",
            profile_img: ""
        }
    },
    banner: "",
    publishedAt: "",
    activity: {
        total_likes: 0,
        total_comments: 0,
        total_parent_comments: 0,
        total_reads: 0
    },
    comments: {
        results: []
    }
};

export const BlogContext = createContext({});

export default function BlogPage() {

    const { blog_id } = useParams();

    const [blog, setBlog] = useState(blogStructure);
    const [loading, setLoading] = useState(true);
    const [similarBlogs, setSimilarBlogs] = useState(null);
    const [isLikedByUser, setIsLikedByUser] = useState(false);
    const [commentsWrapper, setCommentsWrapper] = useState(false);
    const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);

    const {
        title,
        content,
        banner,
        author: {
            personal_info: {
                fullName,
                username: author_username,
                profile_img
            }
        },
        publishedAt,
        tags
    } = blog;

    const resetState = () => {
        setBlog(blogStructure);
        setSimilarBlogs(null);
        setLoading(true);
        setIsLikedByUser(false);
        setCommentsWrapper(false);
        setTotalParentCommentsLoaded(0);
    };

    const fetchBlog = async () => {

        try {

            const { data } = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/get-blog",
                { blog_id }
            );

            const fetchedBlog = data.blog;

            if (!fetchedBlog) {
                throw new Error("Blog not found");
            }

            console.log("Fetched blog:", fetchedBlog);

            // Fetch comments
            const commentsData = await fetchComments({
                blog_id: fetchedBlog._id,
                setParentCommentCountFun: setTotalParentCommentsLoaded
            });

            fetchedBlog.comments = commentsData;

            // Make sure activity always exists
            fetchedBlog.activity = {
                total_likes: fetchedBlog.activity?.total_likes || 0,
                total_comments: fetchedBlog.activity?.total_comments || 0,
                total_parent_comments:
                    fetchedBlog.activity?.total_parent_comments || 0,
                total_reads: fetchedBlog.activity?.total_reads || 0
            };

            // Make sure content always exists
            fetchedBlog.content = fetchedBlog.content || {
                blocks: []
            };

            setBlog(fetchedBlog);

            // Fetch similar blogs only if tags exist
            if (fetchedBlog.tags?.length > 0) {

                const { data: similarData } = await axios.post(
                    import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs",
                    {
                        tag: fetchedBlog.tags[0],
                        limit: 6,
                        eliminate_blog: blog_id
                    }
                );

                setSimilarBlogs(similarData.blogs || []);
            } else {
                setSimilarBlogs([]);
            }

            setLoading(false);

        } catch (err) {

            console.error(
                "FETCH BLOG ERROR:",
                err.response?.data || err.message
            );

            setLoading(false);
        }
    };

    useEffect(() => {

        resetState();
        fetchBlog();

    }, [blog_id]);

    return (
        <AnimationWrapper>

            {loading ? (
                <Loader />
            ) : (

                <BlogContext.Provider
                    value={{
                        blog,
                        setBlog,
                        isLikedByUser,
                        setIsLikedByUser,
                        commentsWrapper,
                        setCommentsWrapper,
                        totalParentCommentsLoaded,
                        setTotalParentCommentsLoaded
                    }}
                >

                    <CommentsContainer />

                    <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">

                        <img
                            src={banner}
                            className="aspect-video"
                            alt={title}
                        />

                        <div className="mt-12">

                            <h2>{title}</h2>

                            <div className="flex max-sm:flex-col justify-between my-8">

                                <div className="flex gap-5 items-start">

                                    <img
                                        src={profile_img}
                                        className="w-12 h-12 rounded-full"
                                        alt={fullName}
                                    />

                                    <p className="capitalize">
                                        {fullName}
                                        <br />
                                        @
                                        <Link
                                            to={`/user/${author_username}`}
                                            className="underline"
                                        >
                                            {author_username}
                                        </Link>
                                    </p>

                                </div>

                            </div>

                            <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
                                Published on {getDay(publishedAt)}
                            </p>

                        </div>

                        <BlogInteraction />

                        {/* Blog Content */}
                        <div className="my-12 font-gelasio blog-page-content">

                            {content?.blocks?.map((block, i) => (

                                <div
                                    key={block.id || i}
                                    className="my-4 md:my-8"
                                >
                                    <BlogContent block={block} />
                                </div>

                            ))}

                        </div>

                        {/* Similar Blogs */}
                        {similarBlogs?.length > 0 && (

                            <>
                                <h1 className="text-2xl mt-14 mb-10 font-medium">
                                    Similar Blogs
                                </h1>

                                {similarBlogs.map((similarBlog, i) => {

                                    const {
                                        author: { personal_info }
                                    } = similarBlog;

                                    return (
                                        <AnimationWrapper
                                            key={similarBlog.blog_id || i}
                                            transition={{
                                                duration: 1,
                                                delay: i * 0.08
                                            }}
                                        >

                                            <BlogPostCard
                                                content={similarBlog}
                                                author={personal_info}
                                            />

                                        </AnimationWrapper>
                                    );

                                })}

                            </>

                        )}

                    </div>

                </BlogContext.Provider>
            )}

        </AnimationWrapper>
    );
}
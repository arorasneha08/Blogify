import { useContext, useState } from "react";
import { UserContext } from "../App";
import { BlogContext } from "../pages/BlogPage";
import { getDay } from "../common/date";
import toast from "react-hot-toast";
import axios from "axios";
import CommentField from "./CommentField";

import {
    FiMessageCircle,
    FiTrash2
} from "react-icons/fi";


const CommentCard = ({
    index,
    leftVal,
    commentData,
    onDeleted
}) => {

    const {
        commented_by,
        commentedAt,
        comment,
        _id
    } = commentData;

    const {
        personal_info = {}
    } = commented_by || {};

    const {
        profile_img,
        fullName,
        username
    } = personal_info;


    const {
        userAuth: {
            access_token,
            _id: currentUserId
        }
    } = useContext(UserContext);


    const {
        blog,
        setBlog
    } = useContext(BlogContext);


    const [isReplying, setIsReplying] = useState(false);

    const [showReplies, setShowReplies] = useState(false);

    const [replies, setReplies] = useState([]);

    const [loadingReplies, setLoadingReplies] = useState(false);

    const [deleting, setDeleting] = useState(false);


    /*
    -----------------------------------------
    REPLY COUNT
    -----------------------------------------
    */

    const replyCount =
        commentData.children?.length ||
        replies.length ||
        0;


    /*
    -----------------------------------------
    CHECK COMMENT OWNER
    -----------------------------------------
    */

    const commentUserId =
        typeof commented_by === "string"
            ? commented_by
            : commented_by?._id;


    const isCommentOwner =
        access_token &&
        currentUserId &&
        commentUserId &&
        String(currentUserId) === String(commentUserId);


    /*
    -----------------------------------------
    REPLY BUTTON
    -----------------------------------------
    */

    const handleReplyClick = () => {

        if (!access_token) {
            toast.error("Login to reply!");
            return;
        }

        setIsReplying(prev => !prev);
    };


    /*
    -----------------------------------------
    LOAD REPLIES
    -----------------------------------------
    */

    const handleRepliesClick = async () => {

        if (showReplies) {
            setShowReplies(false);
            return;
        }

        try {

            setLoadingReplies(true);

            const { data } = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN +
                "/get-comment-replies",
                {
                    comment_id: _id
                }
            );


            const fetchedReplies =
                data.replies || [];


            setReplies(fetchedReplies);

            setShowReplies(true);

        } catch (err) {

            console.error(
                "GET REPLIES ERROR:",
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.error ||
                "Failed to load replies"
            );

        } finally {

            setLoadingReplies(false);

        }
    };


    /*
    -----------------------------------------
    NEW REPLY ADDED
    -----------------------------------------
    */

    const handleReplyAdded = (newReply) => {

        setReplies(prev => [
            ...prev,
            newReply
        ]);

        setShowReplies(true);

    };


    /*
    -----------------------------------------
    DELETE COMMENT / REPLY
    -----------------------------------------
    */

    const handleDelete = async () => {

        if (!access_token) {
            toast.error("Please login");
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this comment?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setDeleting(true);

            const { data } = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN +
                "/delete-comment",
                {
                    comment_id: _id
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${access_token}`
                    }
                }
            );


            /*
            -----------------------------------------
            IF THIS IS A REPLY
            -----------------------------------------
            */

            if (leftVal > 0) {

                if (onDeleted) {
                    onDeleted(_id);
                }

            }


            /*
            -----------------------------------------
            IF THIS IS A PARENT COMMENT
            -----------------------------------------
            */

            else {

                setBlog(prev => ({

                    ...prev,

                    comments: {

                        ...(prev.comments || {}),

                        results:
                            (prev.comments?.results || [])
                                .filter(
                                    item =>
                                        item._id !== _id
                                )

                    },

                    activity: {

                        ...(prev.activity || {}),

                        total_comments:
                            Math.max(
                                0,
                                (prev.activity?.total_comments || 0)
                                -
                                (data.deleted_count || 1)
                            ),

                        total_parent_comments:
                            Math.max(
                                0,
                                (prev.activity?.total_parent_comments || 0)
                                - 1
                            )

                    }

                }));

            }


            toast.success(
                "Comment deleted"
            );


        } catch (err) {

            console.error(
                "DELETE COMMENT ERROR:",
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.error ||
                "Failed to delete comment"
            );

        } finally {

            setDeleting(false);

        }

    };


    return (

        <div
            className="w-full mb-6 mt-5"
            style={{
                paddingLeft:
                    `${leftVal * 20}px`
            }}
        >

            <div
                className="
                    w-full
                    p-5
                    rounded-xl
                    border
                    border-grey
                    bg-white
                "
            >

                {/* =========================
                    USER INFO
                ========================== */}

                <div className="flex items-center gap-3 mb-4">

                    <img
                        src={profile_img}
                        alt={fullName || "User"}
                        className="
                            w-9
                            h-9
                            rounded-full
                            object-cover
                            flex-shrink-0
                        "
                    />

                    <div className="min-w-0 flex-1">

                        <p className="font-medium text-dark-grey truncate">
                            {fullName}
                        </p>

                        <p className="
                            text-sm
                            text-dark-grey
                            opacity-60
                            truncate
                        ">
                            @{username}
                        </p>

                    </div>

                    <p className="
                        text-sm
                        text-dark-grey
                        opacity-60
                        whitespace-nowrap
                    ">
                        {getDay(commentedAt)}
                    </p>

                </div>


                {/* =========================
                    COMMENT TEXT
                ========================== */}

                <p className="
                    font-gelasio
                    text-lg
                    leading-7
                    text-dark-grey
                    whitespace-pre-wrap
                    break-words
                ">
                    {comment}
                </p>


                {/* =========================
                    ACTIONS
                ========================== */}

                <div className="
                    flex
                    items-center
                    gap-5
                    mt-5
                ">


                    {/* REPLIES BUTTON */}

                    <button
                        className="
                            flex
                            items-center
                            gap-1.5
                            text-sm
                            text-dark-grey
                            hover:opacity-70
                        "
                        onClick={handleRepliesClick}
                    >

                        <FiMessageCircle
                            size={15}
                        />

                        <span>
                            {replyCount}{" "}
                            {replyCount === 1
                                ? "Reply"
                                : "Replies"}
                        </span>

                    </button>


                    {/* REPLY BUTTON */}

                    <button
                        className="
                            underline
                            text-sm
                        "
                        onClick={handleReplyClick}
                    >
                        Reply
                    </button>


                </div>


                {/* =========================
                    REPLY FIELD
                ========================== */}

                {isReplying && (

                    <div className="mt-8">

                        <CommentField
                            action="Reply"
                            index={index}
                            replyingTo={_id}
                            setIsReplying={setIsReplying}
                            onReplyAdded={handleReplyAdded}
                        />

                    </div>

                )}


                {/* =========================
                    REPLIES
                ========================== */}

                {showReplies && (

                    <div className="mt-5">

                        {loadingReplies ? (

                            <p className="
                                text-sm
                                text-dark-grey
                                opacity-60
                            ">
                                Loading replies...
                            </p>

                        ) : replies.length === 0 ? (

                            <p className="
                                text-sm
                                text-dark-grey
                                opacity-60
                            ">
                                No replies yet.
                            </p>

                        ) : (

                            replies.map(
                                (reply, replyIndex) => (

                                    <CommentCard
                                        key={reply._id}
                                        index={replyIndex}
                                        leftVal={
                                            leftVal + 1
                                        }
                                        commentData={reply}
                                        onDeleted={
                                            deletedId => {

                                                setReplies(
                                                    prev =>
                                                        prev.filter(
                                                            item =>
                                                                item._id !==
                                                                deletedId
                                                        )
                                                );

                                            }
                                        }
                                    />

                                )
                            )

                        )}

                    </div>

                )}


                {/* =========================
                    DELETE BUTTON
                    BOTTOM RIGHT
                ========================== */}

                {isCommentOwner && (

                    <div className="
                        flex
                        justify-end
                        mt-3
                    ">

                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="
                                w-9
                                h-9
                                rounded-lg
                                border
                                border-grey
                                flex
                                items-center
                                justify-center
                                text-dark-grey
                                hover:bg-grey
                                transition
                            "
                            title="Delete comment"
                        >

                            <FiTrash2
                                size={16}
                            />

                        </button>

                    </div>

                )}

            </div>

        </div>

    );
};


export default CommentCard;
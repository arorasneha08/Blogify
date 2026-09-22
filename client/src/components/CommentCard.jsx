import {getDay} from "../common/date"; 
const CommentCard = ({index , leftVal , commentData}) => {

    let {commented_by : {personal_info : {profile_img , fullName, username}} , commentedAt , comment} = commentData  ;

    return (
        <div
            className="w-full mb-6 mt-5"
            style={{
                paddingLeft: `${leftVal * 20}px`
            }}
        >
            <div className="w-full p-5 rounded-xl border border-grey bg-white">

                {/* User information */}
                <div className="flex items-center gap-3 mb-4">

                    <img
                        src={profile_img}
                        alt={fullName || "User"}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    />

                    <div className="min-w-0 flex-1">

                        <p className="font-medium text-dark-grey truncate">
                            {fullName}
                        </p>

                        <p className="text-sm text-dark-grey opacity-60 truncate">
                            @{username}
                        </p>

                    </div>

                    <p className="text-sm text-dark-grey opacity-60 whitespace-nowrap">
                        {getDay(commentedAt)}
                    </p>

                </div>

                {/* Comment */}
                <p className="font-gelasio text-lg leading-7 text-dark-grey whitespace-pre-wrap break-words">
                    {comment}
                </p>

            </div>
        </div>
    );
}

export default CommentCard;
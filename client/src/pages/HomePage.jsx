import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/InPageNavigation";

export default function Home() {
  return (
    <div>
      <AnimationWrapper>
        <section className="h-cover flex justify-center gap-10">
            <div className="w-full ">
                <InPageNavigation routes={["Home" , "Trending Blogs"]} defaultHidden={["Trending Blogs"]}>

                  <h1>Latest Blogs</h1>
                  <h1>Trending Blogs Here </h1>

                  
                </InPageNavigation>
            </div>
            <div>

            </div>
        </section>
      </AnimationWrapper>
    </div>
  )
}

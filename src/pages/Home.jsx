import Hero from "../Components/Hero";
import Categories from "../Components/Categories";
import BestSellers from "../Components/BestSellers";
import StorySection from "../Components/StorySection";
import WhatsAppButton from "../Components/WhatsappButton";

function Home() {
    return (
        <>
            <Hero />
            <Categories />
            <BestSellers />
            <StorySection />
            <WhatsAppButton />
        </>
    );
}

export default Home;
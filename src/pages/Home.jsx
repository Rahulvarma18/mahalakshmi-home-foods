import Hero from "../Components/Hero";
import Categories from "../Components/Categories";
import WhyUs from "../Components/WhyUs";
import BestSellers from "../Components/BestSellers";
import StorySection from "../Components/StorySection";
import WhatsAppButton from "../Components/WhatsappButton";

function Home() {
    return (
        <>
            <Hero />
            <Categories />
            <WhyUs />
            <BestSellers />
            <StorySection />
            <WhatsAppButton />
        </>
    );
}

export default Home;
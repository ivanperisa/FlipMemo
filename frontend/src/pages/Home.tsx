
import { useNavigate } from "react-router";
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";


import Header from "../components/Header";


const Home = () => {
    const navigate = useNavigate();
    

   


    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col items-center justify-start p-5 w-screen">
                <div className={"absolute z-0 w-screen h-screen "}>
                    <Particles 
                        particleColors={['#ffffff', '#ffffff']}
                        particleCount={150}
                        particleSpread={8}
                        speed={0.08}
                        particleBaseSize={180}
                        moveParticlesOnHover={true}
                        alphaParticles={false}
                        disableRotation={false}
                    />
                </div>

                {/* Header */}
                <Header />

                

                {/* Start Learning Section */}
                <div className="w-full max-w-[1200px] bg-white/90 rounded-3xl shadow-2xl p-12 mb-8 z-10 text-center">
                    <h2 className="font-space text-3xl font-bold text-[#8B6B7A] mb-4">
                        Dobrodošli u FlipMemo! 🎓
                    </h2>
                    <p className="font-space text-lg text-[#8B6B7A]/70 mb-8">
                        Započnite svoje putovanje učenja s flashcard karticama
                    </p>
                    <button onClick={() => navigate('/chooseWordSet')} className="cursor-pointer px-12 py-4 bg-(--color-primary-dark) text-on-dark font-space text-lg font-bold rounded-full shadow-lg hover:shadow-2xl transition-all hover:scale-105 active:scale-95">
                        Započnite Učenje 🚀
                    </button>
                </div>

                
            </div>
        </PageTransition>
    );
};

export default Home;
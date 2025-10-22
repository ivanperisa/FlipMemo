import PageTransition from '../components/PageTransition';
import '../styles/styles.css';
import {useNavigate} from "react-router";
import DotGrid from "../styles/DotGrid.tsx";




const Welcome = () => {
    const navigate=useNavigate();

    function navigateToHome(){
        navigate("/home")
    }



    return (
        
        <div className=' w-screen h-screen flex flex-col items-center justify-center'>
            <img className={"z-1"} src="./logopng.png" alt="Logo"  />

            <div style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 0 }}>
                <DotGrid
                    dotSize={10}
                    gap={15}
                    baseColor="#FFFFFF"
                    activeColor="#FFFFFF"
                    proximity={120}
                    shockRadius={250}
                    shockStrength={5}
                    resistance={750}
                    returnDuration={1.5}
                />
            </div>


            <button onClick={navigateToHome} className={"z-1 rounded-[50px] bg-(--color-primary) w-[200px] h-[52px] transition-all hover:scale-105 hover:cursor-pointer text-white"}>Dobrodošli</button>
        </div>
        






        
    );
};

export default Welcome;
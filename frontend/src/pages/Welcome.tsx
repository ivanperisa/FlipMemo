import '../styles/styles.css';
import {useNavigate} from "react-router";




const Welcome = () => {
    const navigate=useNavigate();

    function navigateToHome(){
        navigate("/Home")
    }



    return (
        <div className='bg-(--color-background) w-screen h-screen flex flex-col items-center justify-center'>
            <img className={" "} src="./Logo.svg" alt="Logo" />


            <button onClick={navigateToHome} className={"rounded-[50px] bg-(--color-primary) w-[200px] h-[52px] transition-all hover:scale-105 hover:cursor-pointer text-white"}>Dobrodošli</button>





        </div>
    );
};

export default Welcome;
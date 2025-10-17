import Particles from "../styles/Particles.tsx";
import AnimatedFace from "../components/AnimatedFace.tsx";
import {Input} from "antd";
import {MailOutlined} from "@ant-design/icons";
import {useState} from "react";


const ForgotPassword = () => {
    const [email, setUsername] = useState('');

    function sendEmail(){
    // TODO: Send email to user
    }


    return (


        <div className="min-h-screen flex flex-col items-center justify-center p-5 w-screen"
             style={{background: 'linear-gradient(180deg, #FFC0CB 0%, #FFE5EC 100%)'}}>
            <div className={"absolute z-0 w-screen h-screen "}>
                <Particles particleColors={['#ffffff', '#ffffff']}
                           particleCount={200}
                           particleSpread={10}
                           speed={0.1}
                           particleBaseSize={200}
                           moveParticlesOnHover={true}
                           alphaParticles={false}
                           disableRotation={false}
                />
            </div>

            <AnimatedFace/>


            {/* Email Container */}
            <div className="w-full max-w-[400px] flex flex-col gap-4">

                <label className={"z-1 font-space text-[#8B6B7A]"}> Unesite E-mail adresu vašeg računa:</label>
                {/* Email Input */}
                <Input type="email"
                    size="large"
                    placeholder="Email"
                    prefix={<MailOutlined style={{color: '#FFB6C1'}}/>}
                    value={email}
                    onChange={(e) => setUsername(e.target.value)}
                    className="rounded-5xl shadow-md w-screen"
                    style={{
                        padding: '12px 20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    }}
                />



                {/* Buttons Container - Centered */}
                <div className="flex flex-col items-center gap-4 mt-6">
                    {/* Send Email Button */}
                    <button onClick={sendEmail}
                        className="rounded-full bg-(--color-primary) w-[320px] sm:w-[360px] h-[56px] transition-all hover:opacity-90 hover:shadow-xl text-white shadow-lg
                         font-space text-[18px] tracking-wide hover:cursor-pointer z-1"

                    >
                        Pošalji E-mail
                    </button>




                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
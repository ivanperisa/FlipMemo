

const Button = ({text}:{text:string}) => {
    return (
        <button className={"rounded-[50px] bg-(--color-primary-dark) text-on-dark w-[200px] h-[52px] transition-all hover:scale-105 hover:cursor-pointer"}>{text}</button>

    );
};

export default Button;
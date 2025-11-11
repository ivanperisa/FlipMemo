
import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import Header from "../components/Header";
import { Space, Table, type TableProps,Tag, Typography } from "antd";
import axiosInstance from "../api/axiosInstance";
import { useEffect, useState } from "react";
import { Mosaic } from "react-loading-indicators";
import { Link } from "react-router";
import { useAuth } from "../context/AuthProvider";

const UserControl = () => {

    const {logout} =useAuth();

    const [Loading,setLoading]=useState(true);
    const [users,setUsers]=useState<User[]|undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    

    //MODELI

    interface User{
        id:number,
        email:string,
        role:string
    }

    const columns:TableProps<User>['columns']=[
        {
    title: 'Id',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Role',
    key: 'role',
    dataIndex: 'role',
    render: (_, { role }) => {
      const color = role === 'Admin' ? 'green' : 'geekblue';
      return <Tag color={color}>{role}</Tag>;
    },
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        {record.role!='Admin' ? 
        <Typography.Link  style={{color:'green'}} onClick={()=>{promoteUser(record)}}>Promote</Typography.Link>
        :
         <Typography.Link style={{color:'orange'}} onClick={()=>{demoteUser(record)}}>Demote</Typography.Link>
        }
        <Typography.Link style={{color:'red'}} onClick={()=>{deleteUser(record)}}>Delete</Typography.Link>
      </Space>
    ),
  },

    ];


    //FUNKCIJE

    async function fetchUsers(){
        setError(null);
        await axiosInstance.get('/api/v1/User')
        .then((response)=>{
            setLoading(false);
            console.log(response.data);
            setUsers(response.data);
        }).catch((error)=>{
            setLoading(false);
            if(error.response.status=='401'){ logout()}
            setError('Greška pri učitavanju korisnika: ' + (error.response?.data?.message || error.message));

            console.log(error);
        })

    }

   useEffect(()=>{
    fetchUsers()
},[]);

async function deleteUser(user:User){
    setError(null);
    await axiosInstance.delete('/api/v1/User/'+user.id)
    .then((response)=>{
        fetchUsers();
        console.log(response);
    })
    .catch((error)=>{
        setError('Greška pri brisanju korisnika: ' + (error.response?.data?.message || error.message));
        console.log(error);
    });

}

async function promoteUser(user:User){
     setError(null);
     await axiosInstance.put('/api/v1/User/'+user.id+'/promote')
    .then((response)=>{
        fetchUsers();
        console.log(response);
    })
    .catch((error)=>{
        setError('Greška pri promicanju korisnika: ' + (error.response?.data?.message || error.message));
        console.log(error);
    });


}

async function demoteUser(user:User){
      setError(null);
      await axiosInstance.put('/api/v1/User/'+user.id+'/demote')
    .then((response)=>{
        fetchUsers();
        console.log(response);
    })
    .catch((error)=>{
        setError('Greška pri deprommicanju korisnika: ' + (error.response?.data?.message || error.message));
        console.log(error);
    });
}


    

    return (
        <PageTransition>
            <div className="min-h-screen flex flex-col items-center justify-start w-screen">
                <div className={"absolute z-0 w-screen h-screen"}>
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

                {/* Error Message */}
                {error && (
                    <div className="z-10 bg-red-500 text-white px-6 py-4 rounded-lg mb-4 max-w-2xl mx-auto shadow-lg">
                        <div className="flex items-center justify-between">
                            <span className="font-space">{error}</span>
                            <button 
                                onClick={() => setError(null)}
                                className="ml-4 text-white hover:text-gray-200 font-bold"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {Loading ? 
                (<Mosaic color="var(--color-primary-dark)" size="medium" text="" textColor="" />):
                (<Table<User> columns={columns} dataSource={users} />)}

                
            </div>
        </PageTransition>
    );
};

export default UserControl;


import PageTransition from "../components/PageTransition";
import Particles from "../styles/Particles";
import Header from "../components/Header";
import { Space, Table, type TableProps,Tag, Typography } from "antd";
import axiosInstance from "../api/axiosInstance";
import { useEffect, useState } from "react";
import { Mosaic } from "react-loading-indicators";
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
        setError('Greška pri demotanju korisnika: ' + (error.response?.data?.message || error.message));
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
                    <div 
                        className="w-full max-w-2xl bg-red-50 border-2 border-red-300 rounded-2xl p-3 z-10 mb-4"
                    >
                        <p className="font-space text-sm text-red-600 text-center">
                            {error}
                        </p>
                    </div>
                )}

                {Loading ? 
                (<Mosaic color="var(--color-primary-dark)" size="medium" text="" textColor="" />):
                (<div className="w-[70%] z-10">
                    <Table<User> columns={columns} dataSource={users} />
                </div>)}

                
            </div>
        </PageTransition>
    );
};

export default UserControl;

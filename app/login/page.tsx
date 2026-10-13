import type {Metadata} from 'next';
export const metadata:Metadata={robots:{index:false,follow:true}};
import AuthPage from "../components/AuthPage";
export default function Login(){return <AuthPage/>;}

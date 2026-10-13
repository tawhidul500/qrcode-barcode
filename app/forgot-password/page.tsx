import type {Metadata} from 'next';
export const metadata:Metadata={robots:{index:false,follow:true}};
import PasswordPage from '../components/PasswordPage';
export default function Page(){return <PasswordPage/>;}

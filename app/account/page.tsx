import type {Metadata} from 'next';
export const metadata:Metadata={robots:{index:false,follow:true}};
import AccountPage from '../components/AccountPage';
export default function Page(){return <AccountPage/>;}

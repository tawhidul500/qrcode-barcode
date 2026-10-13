import type {Metadata} from 'next';
export const metadata:Metadata={robots:{index:false,follow:true}};
import AuthCallback from '../../components/AuthCallback';
export default function Page(){return <AuthCallback/>;}

import SiteHeader from './components/SiteHeader';
import Footer from './components/Footer';
import {Localized} from './components/i18n/LanguageProvider';
export default function NotFound(){
 return <div className="homepage"><SiteHeader/><Localized><main style={{textAlign:'center',padding:'80px 24px'}}><h1>404</h1><p>This page could not be found.</p><a href="/">Back to home</a></main></Localized><Footer/></div>;
}

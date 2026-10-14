# QR type audit and implementation

Reviewed ME-QR catalogue and its Email, SMS, vCard, Wi-Fi, Calendar, WhatsApp, Maps, Smart and App Markets forms. The existing catalogue now contains 78 unique selectable types. This implementation covers native encoding, hosted content/file delivery and routing; external service links still depend on those services. It does not duplicate every ME-QR paid service. Original website design and templates remain.

| Type | Input / behavior |
|---|---|
| Website | Service-specific public HTTP(S) URL |
| Wi-Fi | Structured native input; Text and message types also offer hosted mode |
| Text | Structured native input; Text and message types also offer hosted mode |
| Contacts | Structured native input; Text and message types also offer hosted mode |
| SMS | Structured native input; Text and message types also offer hosted mode |
| Phone | Structured native input; Text and message types also offer hosted mode |
| Location | Structured native input; Text and message types also offer hosted mode |
| WhatsApp | Structured native input; Text and message types also offer hosted mode |
| Facebook | Service-specific public HTTP(S) URL |
| Instagram | Service-specific public HTTP(S) URL |
| Email | Structured native input; Text and message types also offer hosted mode |
| Viber | Service-specific public HTTP(S) URL |
| X | Service-specific public HTTP(S) URL |
| Spotify | Service-specific public HTTP(S) URL |
| Product | Structured native input; Text and message types also offer hosted mode |
| Vcard | Structured native input; Text and message types also offer hosted mode |
| Link List | Editable hosted content / routing rules, or existing URL |
| Mini Website | Editable hosted content / routing rules, or existing URL |
| Coupon | Editable hosted content / routing rules, or existing URL |
| Smart App | Editable hosted content / routing rules, or existing URL |
| Event | Structured native input; Text and message types also offer hosted mode |
| Playlist | Editable hosted content / routing rules, or existing URL |
| Business Page | Editable hosted content / routing rules, or existing URL |
| Menu | Editable hosted content / routing rules, or existing URL |
| TikTok | Service-specific public HTTP(S) URL |
| LinkedIn | Service-specific public HTTP(S) URL |
| Snapchat | Service-specific public HTTP(S) URL |
| YouTube | Service-specific public HTTP(S) URL |
| Reddit | Service-specific public HTTP(S) URL |
| Pinterest | Service-specific public HTTP(S) URL |
| Discord | Service-specific public HTTP(S) URL |
| Any File | Private upload or existing public file URL |
| Office 365 | Service-specific public HTTP(S) URL |
| PCR/Certificate | Private upload or existing public file URL |
| Word/DOCX | Private upload or existing public file URL |
| Google Docs | Service-specific public HTTP(S) URL |
| Google Sheets | Service-specific public HTTP(S) URL |
| MP3 / Audio | Private upload or existing public file URL |
| Image | Private upload or existing public file URL |
| Video | Private upload or existing public file URL |
| PNG | Private upload or existing public file URL |
| PayPal | Service-specific public HTTP(S) URL |
| Crypto Payment | Structured native input; Text and message types also offer hosted mode |
| Payment link | Service-specific public HTTP(S) URL |
| Stripe | Service-specific public HTTP(S) URL |
| GA/UTM Link | Structured native input; Text and message types also offer hosted mode |
| Geo Targeting | Editable hosted content / routing rules, or existing URL |
| Time Targeting | Editable hosted content / routing rules, or existing URL |
| Traffic Split | Editable hosted content / routing rules, or existing URL |
| Review | Service-specific public HTTP(S) URL |
| Attendance | Service-specific public HTTP(S) URL |
| Invoice | Editable hosted content / routing rules, or existing URL |
| App store | Service-specific public HTTP(S) URL |
| Google Play | Service-specific public HTTP(S) URL |
| Galaxy Store | Service-specific public HTTP(S) URL |
| Huawei Gallery | Service-specific public HTTP(S) URL |
| PDF | Private upload or existing public file URL |
| Feedback | Service-specific public HTTP(S) URL |
| Telegram | Service-specific public HTTP(S) URL |
| Booking | Service-specific public HTTP(S) URL |
| Calendar | Structured native input; Text and message types also offer hosted mode |
| PPTX | Private upload or existing public file URL |
| Excel | Private upload or existing public file URL |
| SoundCloud | Service-specific public HTTP(S) URL |
| WeChat | Service-specific public HTTP(S) URL |
| KakaoTalk | Service-specific public HTTP(S) URL |
| LINE | Service-specific public HTTP(S) URL |
| Social Media | Service-specific public HTTP(S) URL |
| Venmo | Service-specific public HTTP(S) URL |
| UPI | Structured native input; Text and message types also offer hosted mode |
| Revolut | Service-specific public HTTP(S) URL |
| Etsy | Service-specific public HTTP(S) URL |
| Amazon | Service-specific public HTTP(S) URL |
| Forms | Service-specific public HTTP(S) URL |
| Custom URL | Editable hosted content / routing rules, or existing URL |
| All-in-one Payment | Editable hosted content / routing rules, or existing URL |
| Logo | Destination URL + existing design controls |
| Shaped | Destination URL + existing design controls |

Sources:
- https://me-qr.com/qr-code-generator
- https://me-qr.com/qr-code-generator/smart-qr-code
- https://supabase.com/docs/guides/storage/security/access-control
- https://supabase.com/docs/reference/javascript/storage-from-createsignedurl
- https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki
- https://eips.ethereum.org/EIPS/eip-681
- https://ref.gs1.org/standards/digital-link/uri-syntax/1.7.0/

Setup: ALL_QR_TYPES_SETUP_BN.md. Hosted pages require the included Neon migration; private uploads require the separate Supabase SQL and server-only service role key.

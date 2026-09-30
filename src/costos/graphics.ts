export function validGraphic(value:unknown):value is string {
 return typeof value==='string' && ((/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)&&value.length<350000)||/^\/cost-graphics\/[a-zA-Z0-9_-]+\.(png|jpg|webp)$/.test(value));
}

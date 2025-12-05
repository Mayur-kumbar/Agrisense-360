export function prettyNumber(n){
  if(n === null || n === undefined) return "-";
  return n.toLocaleString();
}

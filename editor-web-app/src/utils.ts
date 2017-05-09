export function isProd () {
  const location = window.location.href.split('/')[2]
  return location.indexOf('localhost') == -1
}

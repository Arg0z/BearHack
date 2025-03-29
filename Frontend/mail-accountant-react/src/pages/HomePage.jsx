export default function HomePage() {
    
    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const email = params.get('email')
    
    return (
        <>
            <h1>Home Page</h1>
            <div>Hello {email} </div>
        </>
    )
}
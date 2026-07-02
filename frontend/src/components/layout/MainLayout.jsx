import Navbar from "./Navbar";

const MainLayout = ({ children }) => {
    return (
        <>
            <Navbar />
            {children}
        </>
    )
}

export default MainLayout
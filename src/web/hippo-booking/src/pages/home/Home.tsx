import { useUser } from "../../contexts/UserContext.tsx";


const Home = () => {

    const userContext = useUser();

  return (
      <section className="text-section">
          <h1>Hello {userContext.user?.name}</h1>
      </section>
  );
};

export default Home;

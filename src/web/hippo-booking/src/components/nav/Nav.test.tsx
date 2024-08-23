import { BrowserRouter } from "react-router-dom";
import Nav from "./Nav";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import "@testing-library/jest-dom";
import { UserProvider } from "../../contexts/UserContext";

const links = [
  { text: "Make a new booking", link: "/locations" },
  { text: "My bookings", link: "/bookings" },
];

test.each(links)("has common link to $text", async ({ text, link }) => {
  render(
    <UserProvider>
      <BrowserRouter>
        <Nav />
      </BrowserRouter>
    </UserProvider>,
  );

  const linkElement = screen.getByRole("link", { name: text });
  expect(linkElement).toHaveAttribute("href", link);
});

test("Admin link is not visibile for average joe user", async () => {
  const user: User = {
    email: "",
    isAdmin: false,
  };
  render(
    <UserProvider initialUser={user}>
      <BrowserRouter>
        <Nav />
      </BrowserRouter>
    </UserProvider>,
  );

  const adminLink = screen.queryByRole("link", { name: "Admin" });
  expect(adminLink).not.toBeInTheDocument();
});

test("Admin link is visibile for admin user", async () => {
  const user: User = {
    email: "",
    isAdmin: true,
  };
  render(
    <UserProvider initialUser={user}>
      <BrowserRouter>
        <Nav />
      </BrowserRouter>
    </UserProvider>,
  );

  const adminLink = screen.getByRole("link", { name: "Admin" });
  expect(adminLink).toBeInTheDocument();
});

test("Navigation shows sign out if user is signed in", async () => {
  const user: User = {
    email: "",
    isAdmin: false,
  };
  render(
    <UserProvider initialUser={user}>
      <BrowserRouter>
        <Nav />
      </BrowserRouter>
    </UserProvider>,
  );

  // Check that "Sign out" is not visible
  const signOut = screen.queryByRole("button", { name: /Sign out/i });
  expect(signOut).toBeInTheDocument();
});

test("Navigation does not show sign out if user is signed out", async () => {
  render(
    <UserProvider initialUser={null}>
      <BrowserRouter>
        <Nav />
      </BrowserRouter>
    </UserProvider>,
  );

  // Check that "Sign out" is not visible
  const signOut = screen.queryByRole("button", { name: /Sign out/i });
  expect(signOut).not.toBeInTheDocument();
});

export default {};

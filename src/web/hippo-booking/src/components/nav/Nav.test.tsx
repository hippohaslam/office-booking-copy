import { BrowserRouter } from "react-router-dom";
import Nav from "./Nav";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserProvider } from "../../contexts/UserContext";

const links = [
  { text: "Booking", link: "/locations" },
  { text: "Admin", link: "/admin" },
];

test.each(links)("has link to $text", async ({ text, link }) => {
  render(
    <UserProvider>
      <BrowserRouter>
        <Nav />
      </BrowserRouter>
    </UserProvider>
  );

  const linkElement = screen.getByRole("link", { name: text });
  expect(linkElement).toHaveAttribute("href", link);
});

test("Navigation shows sign out if user is signed in", async () => {
  const user: User = {
    email: ""
  };
  render(
    <UserProvider initialUser={user}>
      <BrowserRouter>
        <Nav />
      </BrowserRouter>
    </UserProvider>
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
    </UserProvider>
  );

  // Check that "Sign out" is not visible
  const signOut = screen.queryByRole("button", { name: /Sign out/i });
  expect(signOut).not.toBeInTheDocument();
});

export default {};

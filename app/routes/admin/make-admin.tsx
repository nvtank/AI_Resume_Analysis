import { usePuterStore } from "~/lib/puter";

export default function MakeMeAdmin() {
  const { auth, kv, isAdmin } = usePuterStore();

  const handleMakeAdmin = async () => {
    if (auth.isAuthenticated && auth.user) {
      try {
        // Sử dụng 'auth.user.username' 
        await kv.set(`user-role:${auth.user.username}`, "admin");
        alert("Successfully made you an Admin!");
        window.location.reload(); // Tải lại trang để 'checkAuthStatus' 
      } catch (e) {
        alert("Lỗi: " + (e as Error).message);
      }
    } else {
      alert("You must be logged in to become an Admin.");
    }
  };

  if (isAdmin) {
    return <div style={{padding: "2rem"}}>You are already an Admin.</div>;
  }

  return (
    <div style={{padding: "2rem"}}>
      <h1>Admin Role Assignment Page</h1>
      <p>Click this button to assign Admin rights to your account ({auth.user?.username}).</p>
      <button 
        onClick={handleMakeAdmin}
        style={{padding: "10px", background: "blue", color: "white", border: "none", borderRadius: "5px", cursor: "pointer"}}
      >
        Become Admin
      </button>
    </div>
  );
}
const PostGig = () => {
  const [gig, setGig] = useState({
    title: "",
    description: "",
    budget: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(gig);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Title"
        onChange={e=>setGig({...gig,title:e.target.value})}
      />
      <textarea placeholder="Description"
        onChange={e=>setGig({...gig,description:e.target.value})}
      />
      <input placeholder="Budget"
        onChange={e=>setGig({...gig,budget:e.target.value})}
      />
      <button type="submit">Post Gig</button>
    </form>
  );
};
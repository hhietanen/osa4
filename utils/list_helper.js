const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
//Funktio palauttaa blogien yhteenlaskettujen tykkäysten eli likejen määrän.
  return blogs.reduce(function(sum, blog){
  	return sum + blog.likes
  },0)
}

//Tehtävä 4.5.
const favoriteBlog = (blogs) =>{
	const topBlog = blogs.reduce(function(topBlog, blog){
		if (topBlog === {})
			{return blog}
		else if(topBlog.likes > blog.likes) 
			{return topBlog}
		else if(topBlog.likes <= blog.likes) 
			{return blog}
	}, blogs[0])

	return {
		title : topBlog.title ,
		author: topBlog.author,
		likes: topBlog.likes 
	}
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}



interface AuthorInfoProps {
    author: {
      name: string
      avatar: string
      bio: string
    }
  }
  
  export function AuthorInfo({ author }: AuthorInfoProps) {
    return (
      <div className="flex items-center space-x-4 mb-6 bg-gray-800/50 p-4 rounded-lg border border-neon-green-400">
        <img src={author.avatar} alt={author.name} className="w-12 h-12 rounded-full" />
        <div>
          <h3 className="text-neon-green-400 font-semibold">{author.name}</h3>
          <p className="text-sm text-gray-400">{author.bio}</p>
        </div>
      </div>
    )
  }
  
  
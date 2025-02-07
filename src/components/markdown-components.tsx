import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { motion } from "framer-motion"
import Image from "next/image"
import {useState, type JSX} from "react"
import { Check, Copy } from "lucide-react"



const MotionImage = motion(Image)


export const CustomImage = ({ node, ...props }: any) => (
  <div className="my-8">
    <MotionImage
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      {...props}
      className="rounded-lg shadow-lg"
      width={700}
      height={400}
      layout="responsive"
    />
  </div>
)

export const CustomHeading = ({ level, children }: any) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  return (
    <Tag
      className={`text-neon-green-400 font-bold my-4 ${level === 1 ? "text-4xl" : level === 2 ? "text-3xl" : "text-2xl"}`}
    >
      {children}
    </Tag>
  )
}

export const CustomParagraph = ({ children }: any) => <p className="text-gray-300 leading-relaxed my-4">{children}</p>

export const CustomBlockquote = ({ children }: any) => (
  <blockquote className="border-l-4 border-neon-green-400 pl-4 my-4 italic text-gray-400">{children}</blockquote>
)

export const CustomCode = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "")
    const [copied, setCopied] = useState(false)
  
    const copyToClipboard = () => {
      if (typeof children === "string") {
        navigator.clipboard.writeText(children)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  
    if (!inline && match) {
      return (
        <div className="relative">
          <div className="flex justify-between items-center bg-neon-green-600 text-white px-4 py-2 text-sm rounded-t-md">
            <span>{match[1]}</span>
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            className="rounded-b-md my-0"
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      )
    }
  
    return (
      <code className="bg-gray-800 rounded px-1 py-0.5 text-neon-green-400" {...props}>
        {children}
      </code>
    )
  }
  
  export const CustomList = ({ ordered, children }: any) => {
    return ordered ? (
      <ol className="list-decimal list-inside text-gray-300 my-4">{children}</ol>
    ) : (
      <ul className="list-disc list-inside text-gray-300 my-4">{children}</ul>
    )
  }
  
  export const CustomListItem = ({ children }: any) => {
    return <li className="ml-4">{children}</li>
  }
  
  export const CustomLink = ({ href, children }: any) => {
    return (
      <a href={href} className="text-neon-green-400 hover:underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }
  
  export const CustomHR = () => <hr className="border-neon-green-400 my-6" />
  
  export const CustomTable = ({ children }: any) => {
    return (
      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse border border-primary/20 rounded-lg overflow-hidden">
          {children}
        </table>
      </div>
    );
  };
  
  export const CustomTableHead = ({ children }: any) => {
    return <thead className="bg-primary/10">{children}</thead>;
  };
  
  export const CustomTableBody = ({ children }: any) => {
    return <tbody>{children}</tbody>;
  };
  
  export const CustomTableRow = ({ children }: any) => {
    return <tr className="border-b border-primary/20 last:border-b-0">{children}</tr>;
  };
  
  export const CustomTableCell = ({ isHeader, children }: any) => {
    return isHeader ? (
      <th className="px-4 py-3 text-left font-semibold text-neon-green-400 bg-primary/20">
        {children}
      </th>
    ) : (
      <td className="px-4 py-3 text-white">{children}</td>
    );
  
  };
  
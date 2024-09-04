import { Link } from "react-router-dom";
import "./Breadcrumbs.scss";

type breadcrumbItemProps = {
    text: string;
    to: string;
}

type breadcrumbsProps = {
    items: breadcrumbItemProps[];
}

const Breadcrumbs = ({ items }: breadcrumbsProps) => {
    return (
        <nav aria-label="breadcrumb" className="breadcrumbs-container">
            <ol className="breadcrumbs-content">
                {items.map((item, index) => (
                    <li key={index}>
                        <Link 
                        to={index === items.length - 1 ? {} : item.to} 
                        aria-current={index === items.length - 1 ? "page" : "false"} 
                        className="breadcrumb-item">{item.text}
                        </Link>
                    </li>
                ))}
            </ol>
        </nav>
    )
}

export default Breadcrumbs;
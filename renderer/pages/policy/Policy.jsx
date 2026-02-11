import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from '../../styles/modules/Policy.module.scss';
import termsOfService from './PolicyFiles/terms-of-service.md?raw';
import privacyPolicy from './PolicyFiles/privacy-policy.md?raw';
import subprocessorsPolicy from './PolicyFiles/subprocessors.md?raw';
import copyrightPolicy from './PolicyFiles/copyright-policy.md?raw';
import cookiePolicy from './PolicyFiles/cookie-policy.md?raw';
import dataProcessingAddendum from './PolicyFiles/data-processing-addendum.md?raw';

const data = [
    {
        name: 'Terms',
        list: [
            {
                name: "Terms Of Service",
                linked: "terms-of-service"
            },
            {
                name: "Data Processing Addendum",
                linked: "data-processing-addendum"
            }
        ]
    },
    {
        name: 'Policies',
        list: [
            {
                name: "Privacy Policy",
                linked: "privacy-policy"
            },
            {
                name: "Copyright Policy",
                linked: "copyright-policy"
            },
            {
                name: "Cookie Policy",
                linked: "cookie-policy"
            },
            {
                name: "Subprocessors Policy",
                linked: "subprocessors-policy"
            }
        ]
    },
];

const getContent = (linked) => {
    switch (linked) {
        case 'terms-of-service':
          return termsOfService;
        case 'data-processing-addendum':
          return dataProcessingAddendum;
        case 'privacy-policy':
          return privacyPolicy;
        case 'copyright-policy':
          return copyrightPolicy;
        case 'cookie-policy':
          return cookiePolicy;
        default:
          return subprocessorsPolicy;
    }
};

function PolicyPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(location.search);
    const param = searchParams.get('content') || 'terms-of-service';

    const content = getContent(param);

    return (
        <main className={styles.main}>
            <div className={styles.headerRow}>
                <Header pricing={false} />
            </div>
            <div className={styles.mainDiv}>
                {/* Sidebar list view */}
                <div className={styles.listView}>
                    {data.map((group) => (
                        <div key={group.name}>
                            <div className={styles.name}>{group.name}</div>
                            {group.list.map((item) => (
                                <div
                                    key={item.linked}
                                    className={styles.alistName}
                                    style={{ fontWeight: item.linked === param ? 600 : 300 }}
                                    onClick={() => navigate(`/policy?content=${item.linked}`)}
                                >
                                    {item.name}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Content view */}
                <div className={styles.contentView}>
                    <div className={styles.markdown}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}

export default PolicyPage;


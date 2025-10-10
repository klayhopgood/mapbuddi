import { GithubIcon } from "lucide-react";
import { ContentWrapper } from "./content-wrapper";
import { Logo } from "./logo";

export const Footer = () => {
  return (
    <footer className="p-6 text-primary-foreground bg-primary pb-12">
      <ContentWrapper className="flex items-start md:items-end justify-start md:justify-between gap-2 flex-col md:flex-row">
        <div>
          <Logo />
          <p>Less &ldquo;huh?&rdquo; and more &ldquo;WOW!&rdquo;</p>
        </div>
        <div className="flex gap-2 items-center justify-start md:justify-end">
          <div className="flex items-start md:items-end justify-center flex-col gap-1 text-secondary text-sm">
            <p>© 2025 MapBuddi. All rights reserved.</p>
            <p>Khop Media Pty Ltd • ABN: 77 673 029 117</p>
            <div className="flex gap-4">
              <a href="/privacy-policy" className="text-white border-b pb-[1px] border-secondary">
                Privacy Policy
              </a>
              <a href="/terms-of-service" className="text-white border-b pb-[1px] border-secondary">
                Terms of Service
              </a>
              <a href="/help-centre" className="text-white border-b pb-[1px] border-secondary">
                Help Centre
              </a>
              <a href="mailto:contact@mapbuddi.com" className="text-white border-b pb-[1px] border-secondary">
                Contact
              </a>
            </div>
          </div>
        </div>
      </ContentWrapper>
    </footer>
  );
};

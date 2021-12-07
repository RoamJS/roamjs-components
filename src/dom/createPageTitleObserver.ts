import getPageUidByPageTitle from "../queries/getPageUidByPageTitle";
import getRoamUrl from "./getRoamUrl";

const createPageTitleObserver = ({
  title,
  callback,
  log = false,
}: {
  title: string;
  callback: (d: HTMLDivElement) => void;
  log?: boolean;
}): void => {
  const listener = (url: string) => {
    const d = document.getElementsByClassName(
      "roam-article"
    )[0] as HTMLDivElement;
    if (d) {
      const uid = getPageUidByPageTitle(title);
      const attribute = `data-roamjs-${uid}`;
      if ((uid && url === getRoamUrl(uid)) || (log && url === getRoamUrl())) {
        // React's rerender crushes the old article/heading
        setTimeout(() => {
          if (!d.hasAttribute(attribute)) {
            d.setAttribute(attribute, "true");
            callback(
              document.getElementsByClassName(
                "roam-article"
              )[0] as HTMLDivElement
            );
          }
        }, 1);
      } else {
        d.removeAttribute(attribute);
      }
    }
  };
  window.addEventListener("hashchange", (e) => listener(e.newURL));
  listener(window.location.href);
};

export default createPageTitleObserver;

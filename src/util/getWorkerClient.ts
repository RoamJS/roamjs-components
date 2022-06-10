const getWorkerClient = ({
  name,
  onLoad,
}: {
  name: string;
  onLoad?: () => Promise<void>;
}) => {
  const workerUrl = (document.currentScript as HTMLScriptElement).src.replace(
    /\/main\.js$/,
    `/${name}.js`
  );

  const worker: { current?: Worker; init: boolean } = {
    current: undefined,
    init: false,
  };

  const listeners: { [name: string]: (a: unknown) => void } = {};
  const initializeWorker = () =>
    fetch(workerUrl)
      .then((r) => r.blob())
      .then((r) => {
        worker.current = new Worker(window.URL.createObjectURL(r));
        worker.current.onmessage = (e) => {
          const { method, ...data } = e.data;
          listeners[method]?.(data);
        };
        return onLoad ? onLoad() : Promise.resolve();
      })
      .then(() => {
        worker.init = true;
        document.body.dispatchEvent(new Event(`roamjs:${name}-worker:init`));
        return worker.current;
      });
  const terminateWorker = () => {
    worker.current?.terminate();
  };
  const getWorker = (): Promise<Worker> =>
    worker.current && worker.init
      ? Promise.resolve(worker.current)
      : new Promise((resolve) =>
          document.body.addEventListener(
            `roamjs:${name}-worker:init`,
            () => worker.current && resolve(worker.current)
          )
        );
  return {
    getWorker,
    terminateWorker,
    initializeWorker,
    listeners,
  };
};

export default getWorkerClient;

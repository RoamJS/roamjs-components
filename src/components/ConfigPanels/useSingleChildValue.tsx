import { useCallback, useState, useEffect } from "react";
import getFirstChildUidByBlockUid from "../../queries/getFirstChildUidByBlockUid";
import getTextByBlockUid from "../../queries/getTextByBlockUid";

const useSingleChildValue = <T extends string | number | Date>({
  defaultValue,
  uid: initialUid,
  title,
  parentUid,
  order,
  transform,
  toStr,
}: {
  title: string;
  parentUid: string;
  order: number;
  uid?: string;
  defaultValue: T;
  transform: (s: string) => T;
  toStr: (t: T) => string;
}): { value: T; onChange: (v: T) => void } => {
  const [uid, setUid] = useState(initialUid);
  const [valueUid, setValueUid] = useState<string | undefined>(undefined);
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (uid) {
      const loadValueUid = async () => {
        const firstChildUid = await getFirstChildUidByBlockUid(uid);
        setValueUid(firstChildUid);
      };
      loadValueUid();
    }
  }, [uid]);

  useEffect(() => {
    if (valueUid) {
      const loadValue = async () => {
        const text = await getTextByBlockUid(valueUid);
        setValue(transform(text));
      };
      loadValue();
    }
  }, [valueUid, transform]);

  const onChange = useCallback(
    (v: T) => {
      setValue(v);
      if (valueUid) {
        window.roamAlphaAPI.updateBlock({
          block: { string: toStr(v), uid: valueUid },
        });
      } else if (uid) {
        const newValueUid = window.roamAlphaAPI.util.generateUID();
        window.roamAlphaAPI.createBlock({
          block: { string: toStr(v), uid: newValueUid },
          location: { order: 0, "parent-uid": uid },
        });
        setValueUid(newValueUid);
      } else {
        const newUid = window.roamAlphaAPI.util.generateUID();
        window.roamAlphaAPI.createBlock({
          block: { string: title, uid: newUid },
          location: { order, "parent-uid": parentUid },
        });
        setTimeout(() => setUid(newUid));
        const newValueUid = window.roamAlphaAPI.util.generateUID();
        window.roamAlphaAPI.createBlock({
          block: { string: toStr(v), uid: newValueUid },
          location: { order: 0, "parent-uid": newUid },
        });
        setValueUid(newValueUid);
      }
    },
    [setValue, setValueUid, title, parentUid, order, uid, valueUid, setUid]
  );
  return { value, onChange };
};

export default useSingleChildValue;

import React from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Avatar } from "@nextui-org/avatar";
import { Button } from "@nextui-org/button";
import Link from "next/link";
import { GoVerified } from "react-icons/go";
import { useUser } from "@/src/hooks/useUser";
import { X } from "lucide-react";
import Follow from "../publicProfile/follow";

interface AddConnectionCardProps {
  name: string;
  title: string;
  avatarSrc: string;
  _id: string;
  followers: string[];
  verified: boolean;
  onConnect: () => void;
  onIgnore: () => void;
}

const AddConnectionCard: React.FC<AddConnectionCardProps> = ({
  name,
  title,
  avatarSrc,
  _id,
  followers,
  verified,
  onConnect,
  onIgnore,
}) => {
  const { userInfo: user } = useUser();

  return (
    <Card className="max-w-[340px] w-full mx-auto">
      <CardHeader className="justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${_id}`}>
            <Avatar
              className="w-10 h-10 rounded-full object-cover text-[22px]"
              name={name?.charAt(0).toUpperCase()}
              src={avatarSrc || undefined}
            />
          </Link>
          <div className="flex flex-col items-start -mt-2">
            <div className="flex flex-row gap-1 items-center">
              <Link
                className="text-[14px] text-default-800 flex items-center gap-1 mt-0.5 whitespace-nowrap"
                href={`/profile/${_id}`}
              >
                {name}{" "}
                {verified && <GoVerified className="text-primaryColor" />}
              </Link>
            </div>
            <p className="text-default-500 text-[12px]">
              {title ? title : "No bio available"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <p className="text-default-500 text-[13px]">
          ( {followers.length} ) mutual connections
        </p>
      </CardBody>
      <CardFooter className="gap-3 flex justify-between items-center">
        <div className="-mt-3">
          {" "}
          {_id !== user?._id && user?._id && <Follow userId={_id} />}
        </div>
        <Button
          className="secondary-button"
          radius="full"
          size="sm"
          onPress={onIgnore}
          startContent={<X size={18} />}
        >
          Ignore
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AddConnectionCard;

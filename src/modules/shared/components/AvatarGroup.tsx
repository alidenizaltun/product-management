import React from "react";
import classnames from "classnames";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
type AvatarStatus = "online" | "offline" | "away" | "busy";

const statusColorMap: Record<AvatarStatus, string> = {
  online: "success",
  offline: "gray",
  away: "warning",
  busy: "danger",
};

const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/* ------------------------------------------------------------------ */
/*  Avatar                                                             */
/* ------------------------------------------------------------------ */

interface AvatarProps {
  name: string;
  image?: string;
  size?: AvatarSize;
  color?: string;
  status?: AvatarStatus;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  image,
  size = "md",
  color = "primary",
  status,
  className,
}) => {
  const classes = classnames(
    "user-avatar",
    { [`user-avatar-${size}`]: size !== "md" },
    `bg-${color}`,
    className
  );

  return (
    <div className={classes} title={name}>
      {image ? (
        <img src={image} alt={name} />
      ) : (
        <span>{getInitials(name)}</span>
      )}
      {status && (
        <span
          className={`dot dot-${size === "xs" ? "xs" : "md"} dot-${statusColorMap[status]}`}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
          }}
        />
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  AvatarGroup                                                        */
/* ------------------------------------------------------------------ */

interface AvatarGroupUser {
  name: string;
  image?: string;
}

interface AvatarGroupProps {
  users: AvatarGroupUser[];
  max?: number;
  size?: "sm" | "md" | "lg";
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  users,
  max = 5,
  size = "sm",
}) => {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className="user-avatar-group">
      {visible.map((user, idx) => (
        <Avatar key={idx} name={user.name} image={user.image} size={size} color="primary" />
      ))}
      {overflow > 0 && (
        <div className={classnames("user-avatar", { [`user-avatar-${size}`]: size !== "md" }, "bg-light")}>
          <span>+{overflow}</span>
        </div>
      )}
    </div>
  );
};

import React from "react";
import Icon from "@/components/icon/Icon";
import { Avatar } from "./AvatarGroup";

/* ------------------------------------------------------------------ */
/*  ProfileCard                                                        */
/* ------------------------------------------------------------------ */

interface ProfileCardProps {
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  stats?: { label: string; value: string | number }[];
  actions?: React.ReactNode;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  role,
  email,
  phone,
  avatar,
  stats,
  actions,
  className,
}) => (
  <div className={`card card-bordered${className ? ` ${className}` : ""}`}>
    <div className="card-inner text-center py-4">
      <div className="mb-3 d-flex justify-content-center">
        <Avatar name={name} image={avatar} size="xl" color="primary" />
      </div>
      <h5 className="mb-1">{name}</h5>
      {role && <p className="text-soft fs-13px mb-2">{role}</p>}

      <ul className="list-unstyled mb-3">
        {email && (
          <li className="d-flex align-items-center justify-content-center gap-1 text-soft fs-13px mb-1">
            <Icon name="mail" />
            <span>{email}</span>
          </li>
        )}
        {phone && (
          <li className="d-flex align-items-center justify-content-center gap-1 text-soft fs-13px">
            <Icon name="call" />
            <span>{phone}</span>
          </li>
        )}
      </ul>

      {stats && stats.length > 0 && (
        <div className="d-flex justify-content-center gap-4 border-top pt-3 mt-3">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="fw-bold fs-5">{s.value}</div>
              <div className="text-soft fs-12px text-uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {actions && <div className="mt-3">{actions}</div>}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  ProfileHeader                                                      */
/* ------------------------------------------------------------------ */

interface ProfileBadge {
  label: string;
  color: string;
}

interface ProfileHeaderProps {
  name: string;
  subtitle?: string;
  avatar?: string;
  coverImage?: string;
  badges?: ProfileBadge[];
  actions?: React.ReactNode;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  subtitle,
  avatar,
  coverImage,
  badges,
  actions,
}) => (
  <div className="card card-bordered">
    {coverImage && (
      <div
        className="card-img-top"
        style={{
          height: 180,
          backgroundImage: `url(${coverImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    )}
    <div className="card-inner">
      <div className="d-flex flex-wrap align-items-center gap-3">
        <div style={{ marginTop: coverImage ? -50 : 0 }}>
          <Avatar name={name} image={avatar} size="xl" color="primary" />
        </div>
        <div className="flex-grow-1">
          <h5 className="mb-0">{name}</h5>
          {subtitle && <span className="text-soft fs-13px">{subtitle}</span>}
          {badges && badges.length > 0 && (
            <div className="d-flex flex-wrap gap-1 mt-1">
              {badges.map((b, i) => (
                <span key={i} className={`badge bg-${b.color}`}>
                  {b.label}
                </span>
              ))}
            </div>
          )}
        </div>
        {actions && <div className="d-flex gap-2">{actions}</div>}
      </div>
    </div>
  </div>
);

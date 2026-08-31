import type { CSSProperties, ElementType, ReactNode } from "react";

/**
 * Şablon bileşenlerinin ortak prop tipleri.
 *
 * Bu bileşenler tanımadıkları prop'ları `...props` ile alt elemana geçirir;
 * indeks imzası bu davranışı tip düzeyinde de korur. Asıl amaç, destructuring'den
 * çıkarım yapılınca her prop'un zorunlu sayılmasını engellemek.
 */
export type PassThroughProps = {
  [key: string]: any;
};

export type BaseComponentProps = PassThroughProps & {
  className?: string;
  children?: ReactNode;
};

/** `props.tag` ile render edilecek etiketi değiştirebilen bileşenler. */
export type TaggableProps = BaseComponentProps & {
  tag?: ElementType;
};

/** Bootstrap kırılım noktalarında kullanılan sütun genişliği. */
export type GridSpan = string | number;

/** Şablonun boyut ölçeği: xs, sm, md, lg, xl. */
export type SizeToken = string;

/** Şablonun renk teması: primary, danger, azure-dim, gray vb. */
export type ThemeToken = string;

export type StyleProps = {
  id?: string;
  style?: CSSProperties;
};

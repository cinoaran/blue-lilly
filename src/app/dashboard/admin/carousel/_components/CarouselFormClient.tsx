"use client";

import React from "react";
import CarouselForm, {type CarouselInitial} from "./CarouselForm";

type Props = {
  mode: "add" | "edit";
  initial?: CarouselInitial;
};

export default function CarouselFormClient(props: Props) {
  return <CarouselForm {...props} />;
}

import React from "react";
import Prism from "prismjs";
import { BLOCK_TAGS, MARK_TAGS, INLINE_TAGS } from "./constants";
import { LinkNode } from "../plugins/link";
import { nodeRenderer, markRenderer } from "./renderer";

export default [
    {
        deserialize(el, next) {
            const type = BLOCK_TAGS[el.tagName.toLowerCase()];
            if (type) {
                return {
                    object: "block",
                    type: type,
                    data: {
                        className: el.getAttribute("class"),
                        src: el.getAttribute("src") || null,
                        href: el.getAttribute("href") || null,
                        language: el.getAttribute("data-language") || null
                    },
                    nodes: next(el.childNodes)
                };
            }
        },
        serialize(obj, children) {
            if (obj.object == "block") {
                const props = { children, node: obj };
                if (obj.type == "paragraph") {
                    return <p>{props.children}</p>;
                } else if (obj.type === "code_block") {
                    const html = Prism.highlight(
                        obj.text,
                        Prism.languages.javascript,
                        "javascript"
                    );
                    return (
                        <pre
                            className="prism-dark"
                            data-language={obj.data.get("language")}
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                    );
                }
                return nodeRenderer(obj.type, props);
            }
        }
    },
    // Add a new rule that handles marks...
    {
        deserialize(el, next) {
            const type = MARK_TAGS[el.tagName.toLowerCase()];
            if (type) {
                return {
                    object: "mark",
                    type: type,
                    nodes: next(el.childNodes)
                };
            }
        },
        serialize(obj, children) {
            if (obj.object == "mark") {
                const props = { children };
                return markRenderer(obj.type, props);
            }
        }
    },
    {
        deserialize: (el, next) => {
            if (el.tagName != "a") {
                return;
            }
            const type = INLINE_TAGS[el.tagName];

            if (!type) {
                return;
            }
            return {
                object: "inline",
                type: type,
                nodes: next(el.childNodes),
                data: {
                    href: el.attrs.find(({ name }) => name == "href").value
                }
            };
        },
        serialize: (obj, children) => {
            if (obj.object != "inline") {
                return;
            }
            const props = { children, node: obj };
            switch (obj.type) {
                case "link":
                    return <LinkNode {...props} />;
            }
        }
    }
];

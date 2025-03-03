import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { has } from "./common";

export function findHookContextNode(path: NodePath) {
  // useTranslation hook을 호출할 수 있는 node를 찾아 반환
  // functionLike
  // hook 또는 react 컴포넌트

  const hookContextNodes: t.Function[] = [];

  path.traverse({
    FunctionDeclaration(path) {
      if (isFunctionalComponent(path)) {
        hookContextNodes.push(path.node);
      }
    },
    ArrowFunctionExpression(path) {
      if (isFunctionalComponent(path)) {
        hookContextNodes.push(path.node);
      }
    },
    FunctionExpression(path) {
      if (isFunctionalComponent(path)) {
        hookContextNodes.push(path.node);
      }
    },
  });
}

function isFunctionalComponent(path: NodePath<t.Function>): boolean {
  let functionName: string | undefined;

  // FunctionDeclaration, FunctionExpression
  if (
    (t.isFunctionDeclaration(path.node) || t.isFunctionExpression(path.node)) &&
    path.node.id
  ) {
    functionName = path.node.id.name;
  } else if (t.isArrowFunctionExpression(path.node)) {
    if (path.parentPath.isVariableDeclarator()) {
      const id = path.parentPath.node.id;
      if (t.isIdentifier(id)) {
        functionName = id.name;
      }
    }
  }

  if (!functionName) {
    return false;
  }

  // 대문자로 시작하는지 간단 체크
  if (!/^[A-Z]/.test(functionName)) {
    return false;
  }

  return has(path, (node) => t.isJSXElement(node) || t.isJSXFragment(node));
}

function isHookFunction
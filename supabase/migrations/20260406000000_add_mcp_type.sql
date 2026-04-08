-- Add MCP server listing support
-- product_type is already a plain text column, no enum change needed.
-- Just add the MCP-specific metadata columns.

ALTER TABLE apis
  ADD COLUMN IF NOT EXISTS mcp_server_url text,
  ADD COLUMN IF NOT EXISTS mcp_tools jsonb;

-- Allow product_type = 'mcp' by documenting the supported values
-- (no check constraint exists to modify — product_type is unrestricted text)

COMMENT ON COLUMN apis.product_type IS 'Type of listing: api | dataset | mcp';
COMMENT ON COLUMN apis.mcp_server_url IS 'MCP server URL for MCP-type listings';
COMMENT ON COLUMN apis.mcp_tools IS 'JSON array of MCP tool definitions: [{name, description}]';
